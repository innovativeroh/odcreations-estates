"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type MenuType = "category" | "custom_url" | "website_url";
type Visibility = "always" | "logged_in" | "logged_out" | "role";

interface MenuItemRaw {
  _id: string;
  label: string;
  type: MenuType;
  url?: string;
  parentId: string | null;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  highlight: boolean;
  icon?: string;
  visibility: Visibility;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface MenuNode extends MenuItemRaw {
  children: MenuNode[];
}

interface FormState {
  label: string;
  type: MenuType;
  url: string;
  parentId: string; // "" = top level
  openInNewTab: boolean;
  highlight: boolean;
  icon: string;
  isActive: boolean;
  visibility: Visibility;
  roles: string[];
}

const emptyForm = (parentId = ""): FormState => ({
  label: "",
  type: "category",
  url: "",
  parentId,
  openInNewTab: false,
  highlight: false,
  icon: "",
  isActive: true,
  visibility: "always",
  roles: [],
});

const inputCls = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-title placeholder-text-sub outline-none focus:border-brand/40 transition-all duration-300";
const selectCls = "w-full bg-input-bg border border-input-border rounded-xl px-4 py-2.5 text-xs text-txt-body outline-none focus:border-brand/45 cursor-pointer transition-all duration-300";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold text-txt-muted uppercase tracking-wider block mb-1.5">{children}</label>;
}

const TYPE_BADGE: Record<MenuType, string> = {
  category: "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20",
  custom_url: "bg-cyan-500/10 text-cyan-650 dark:text-cyan-400 border-cyan-500/20",
  website_url: "bg-orange-500/10 text-orange-650 dark:text-orange-450 border-orange-500/20",
};

const TYPE_LABEL: Record<MenuType, string> = {
  category: "Category",
  custom_url: "Custom URL",
  website_url: "Website URL",
};

const VISIBILITY_LABEL: Record<Visibility, string> = {
  always: "Always visible",
  logged_in: "Only when logged in",
  logged_out: "Only when logged out",
  role: "Specific roles",
};

const PUBLIC_ROLES = ["user", "agent", "owner"];

function buildTree(flat: MenuItemRaw[]): MenuNode[] {
  const byParent = new Map<string, MenuItemRaw[]>();
  for (const item of flat) {
    const key = item.parentId ?? "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }
  function build(parentKey: string): MenuNode[] {
    const siblings = (byParent.get(parentKey) ?? []).slice().sort((a, b) => a.order - b.order);
    return siblings.map((s) => ({ ...s, children: build(s._id) }));
  }
  return build("root");
}

function flattenTree(nodes: MenuNode[]): MenuItemRaw[] {
  const out: MenuItemRaw[] = [];
  function walk(list: MenuNode[]) {
    for (const n of list) {
      const { children, ...rest } = n;
      out.push(rest);
      walk(children);
    }
  }
  walk(nodes);
  return out;
}

function countDescendants(node: MenuNode): number {
  let count = 0;
  for (const c of node.children) count += 1 + countDescendants(c);
  return count;
}

function findNode(nodes: MenuNode[], id: string): MenuNode | null {
  for (const n of nodes) {
    if (n._id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

function isDescendant(node: MenuNode, targetId: string): boolean {
  for (const c of node.children) {
    if (c._id === targetId) return true;
    if (isDescendant(c, targetId)) return true;
  }
  return false;
}

// Removes a node (by id) from the tree, returns [newTree, removedNode]
function removeNode(nodes: MenuNode[], id: string): [MenuNode[], MenuNode | null] {
  let removed: MenuNode | null = null;
  const filtered: MenuNode[] = [];
  for (const n of nodes) {
    if (n._id === id) {
      removed = n;
      continue;
    }
    const [newChildren, childRemoved] = removeNode(n.children, id);
    if (childRemoved) removed = childRemoved;
    filtered.push({ ...n, children: newChildren });
  }
  return [filtered, removed];
}

function insertNode(
  nodes: MenuNode[],
  parentId: string | null,
  index: number,
  node: MenuNode
): MenuNode[] {
  if (parentId === null) {
    const copy = nodes.slice();
    copy.splice(index, 0, node);
    return copy;
  }
  return nodes.map((n) => {
    if (n._id === parentId) {
      const children = n.children.slice();
      children.splice(index, 0, node);
      return { ...n, children };
    }
    return { ...n, children: insertNode(n.children, parentId, index, node) };
  });
}

function recomputeOrders(nodes: MenuNode[], parentId: string | null): MenuNode[] {
  return nodes.map((n, i) => ({
    ...n,
    parentId,
    order: i,
    children: recomputeOrders(n.children, n._id),
  }));
}

// Flatten categories (for parent select) with depth for indentation
function flattenCategories(nodes: MenuNode[], depth = 0, excludeId?: string): Array<{ id: string; label: string; depth: number }> {
  let out: Array<{ id: string; label: string; depth: number }> = [];
  for (const n of nodes) {
    if (excludeId && (n._id === excludeId || isDescendant(n, excludeId))) continue;
    out.push({ id: n._id, label: n.label, depth });
    out = out.concat(flattenCategories(n.children, depth + 1, excludeId));
  }
  return out;
}

export default function MenuBuilderPage() {
  const [tree, setTree] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: "before" | "after" | "inside" } | null>(null);

  function load() {
    setLoading(true);
    api
      .get<MenuItemRaw[]>("/api/menu/admin")
      .then((flat) => setTree(buildTree(flat)))
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const allCategoryOptions = useMemo(
    () => flattenCategories(tree, 0, editingId ?? undefined),
    [tree, editingId]
  );

  function toggleExpand(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  function openCreate(parentId: string | null = null) {
    setEditingId(null);
    setForm(emptyForm(parentId ?? ""));
    setModalOpen(true);
  }

  function openEdit(node: MenuNode) {
    setEditingId(node._id);
    setForm({
      label: node.label,
      type: node.type,
      url: node.url ?? "",
      parentId: node.parentId ?? "",
      openInNewTab: node.openInNewTab,
      highlight: node.highlight,
      icon: node.icon ?? "",
      isActive: node.isActive,
      visibility: node.visibility,
      roles: node.roles ?? [],
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.label.trim()) {
      toast.error("Label is required");
      return;
    }
    if ((form.type === "custom_url" || form.type === "website_url") && !form.url.trim()) {
      toast.error("URL is required for this item type");
      return;
    }
    setSaving(true);
    const body = {
      label: form.label.trim(),
      type: form.type,
      url: form.type === "category" ? undefined : form.url.trim(),
      parentId: form.parentId || null,
      openInNewTab: form.openInNewTab,
      highlight: form.highlight,
      icon: form.icon.trim() || undefined,
      isActive: form.isActive,
      visibility: form.visibility,
      roles: form.visibility === "role" ? form.roles : [],
    };
    try {
      if (editingId) {
        await api.put(`/api/menu/${editingId}`, body);
        toast.success("Menu item updated");
      } else {
        await api.post("/api/menu", body);
        toast.success("Menu item created");
      }
      closeModal();
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(node: MenuNode) {
    const descendants = countDescendants(node);
    const msg =
      descendants > 0
        ? `Delete "${node.label}" and ${descendants} sub-item${descendants > 1 ? "s" : ""}?`
        : `Delete "${node.label}"?`;
    if (!confirm(msg)) return;
    try {
      await api.delete(`/api/menu/${node._id}`);
      toast.success("Menu item deleted");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function toggleActive(node: MenuNode) {
    try {
      await api.put(`/api/menu/${node._id}`, { isActive: !node.isActive });
      setTree((prev) => updateNodeInTree(prev, node._id, { isActive: !node.isActive }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  function updateNodeInTree(nodes: MenuNode[], id: string, patch: Partial<MenuNode>): MenuNode[] {
    return nodes.map((n) => {
      if (n._id === id) return { ...n, ...patch };
      return { ...n, children: updateNodeInTree(n.children, id, patch) };
    });
  }

  async function persistTree(newTree: MenuNode[]) {
    const recomputed = recomputeOrders(newTree, null);
    setTree(recomputed);
    const flat = flattenTree(recomputed);
    const payload = flat.map((f) => ({ id: f._id, parentId: f.parentId, order: f.order }));
    try {
      await api.patch("/api/menu/reorder", payload);
      toast.success("Menu order saved");
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const draggedNode = findNode(tree, dragId);
    if (draggedNode && (draggedNode._id === targetId || isDescendant(draggedNode, targetId))) {
      setDropTarget(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const ratio = offsetY / rect.height;
    let position: "before" | "after" | "inside";
    if (ratio < 0.25) position = "before";
    else if (ratio > 0.75) position = "after";
    else position = "inside";
    setDropTarget({ id: targetId, position });
  }

  function handleDragEnd() {
    setDragId(null);
    setDropTarget(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || !dropTarget || dropTarget.id !== targetId) {
      setDragId(null);
      setDropTarget(null);
      return;
    }
    const draggedId = dragId;
    const { position } = dropTarget;
    setDragId(null);
    setDropTarget(null);

    if (draggedId === targetId) return;
    const draggedNode = findNode(tree, draggedId);
    if (!draggedNode) return;
    if (draggedNode._id === targetId || isDescendant(draggedNode, targetId)) {
      toast.error("Cannot move an item into its own sub-item");
      return;
    }

    const [treeWithoutDragged, removed] = removeNode(tree, draggedId);
    if (!removed) return;

    let newTree: MenuNode[];
    if (position === "inside") {
      // make dragged a child of target (append at end)
      const targetNode = findNode(treeWithoutDragged, targetId);
      const index = targetNode ? targetNode.children.length : 0;
      newTree = insertNode(treeWithoutDragged, targetId, index, removed);
      setExpanded((p) => ({ ...p, [targetId]: true }));
    } else {
      // sibling insert before/after target — target's own parentId tells us the sibling group
      const targetNodeForParent = findNode(treeWithoutDragged, targetId);
      const parentId = targetNodeForParent ? targetNodeForParent.parentId : null;
      const parentNode = parentId ? findNode(treeWithoutDragged, parentId) : null;
      const siblings = parentNode ? parentNode.children : treeWithoutDragged;
      const targetIndex = siblings.findIndex((n) => n._id === targetId);
      const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
      newTree = insertNode(treeWithoutDragged, parentId, insertIndex, removed);
    }

    persistTree(newTree);
  }

  function renderNode(node: MenuNode, depth: number) {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded[node._id] ?? true;
    const isDragging = dragId === node._id;
    const isDropTarget = dropTarget?.id === node._id;

    return (
      <div key={node._id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node._id)}
          onDragOver={(e) => handleDragOver(e, node._id)}
          onDrop={(e) => handleDrop(e, node._id)}
          onDragEnd={handleDragEnd}
          style={{ marginLeft: depth * 24 }}
          className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-150 mb-1 ${
            isDragging ? "opacity-40" : ""
          } ${
            isDropTarget && dropTarget?.position === "inside"
              ? "bg-brand/10 border-brand/40"
              : "bg-card-bg border-card-border"
          }`}
        >
          {isDropTarget && dropTarget?.position === "before" && (
            <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
          {isDropTarget && dropTarget?.position === "after" && (
            <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}

          {/* Drag handle */}
          <span className="cursor-grab active:cursor-grabbing text-txt-sub flex-shrink-0" title="Drag to reorder">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
            </svg>
          </span>

          {/* Expand chevron */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node._id)}
              className="p-0.5 rounded text-txt-sub hover:text-txt-title transition-colors cursor-pointer border-none bg-transparent flex-shrink-0"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-4.5 flex-shrink-0" />
          )}

          {/* Icon */}
          {node.icon && <span className="text-sm flex-shrink-0">{node.icon}</span>}

          {/* Label + badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-bold text-txt-title truncate">{node.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${TYPE_BADGE[node.type]}`}>
              {TYPE_LABEL[node.type]}
            </span>
            {node.highlight && (
              <span title="Highlighted / featured item" className="text-amber-500 flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.062 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                </svg>
              </span>
            )}
            {node.url && <span className="text-[10px] text-txt-muted truncate hidden sm:inline">{node.url}</span>}
          </div>

          {/* Active toggle */}
          <button
            onClick={() => toggleActive(node)}
            title={node.isActive ? "Active — click to disable" : "Inactive — click to enable"}
            className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer outline-none border-none flex-shrink-0 ${
              node.isActive ? "bg-emerald-500" : "bg-neutral-500/20 dark:bg-neutral-800"
            }`}
          >
            <span
              className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-300 ${
                node.isActive ? "left-4" : "left-0.5"
              }`}
            />
          </button>

          {/* Add child */}
          <button
            onClick={() => openCreate(node._id)}
            title="Add child item"
            className="p-1.5 rounded-lg text-txt-sub hover:text-brand hover:bg-brand/10 transition-all cursor-pointer border-none bg-transparent flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Edit */}
          <button
            onClick={() => openEdit(node)}
            title="Edit"
            className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-all cursor-pointer border-none bg-transparent flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(node)}
            title="Delete"
            className="p-1.5 rounded-lg text-txt-sub hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  }

  const isEmpty = !loading && tree.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-txt-muted font-semibold max-w-lg">
          Drag items to reorder or nest them into categories. Changes to the tree shape are saved automatically after each drop.
        </p>
        <button
          onClick={() => openCreate(null)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all cursor-pointer border-none shadow-md shadow-brand/10 whitespace-nowrap"
        >
          + Add Top Level Category
        </button>
      </div>

      <div className="bg-card-bg border border-card-border rounded-2xl p-4">
        {loading && <div className="py-20 text-center text-xs text-txt-muted">Loading menu…</div>}

        {isEmpty && (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <p className="text-xs text-txt-muted font-semibold">No menu items yet — add your first category to get started.</p>
            <button
              onClick={() => openCreate(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all cursor-pointer border-none shadow-md shadow-brand/10"
            >
              + Add First Category
            </button>
          </div>
        )}

        {!loading && !isEmpty && <div>{tree.map((n) => renderNode(n, 0))}</div>}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-card-bg border border-card-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-txt-title">{editingId ? "Edit Menu Item" : "Add Menu Item"}</h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-txt-sub hover:text-txt-title hover:bg-neutral-900/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Label</Label>
                  <input
                    className={inputCls}
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. Properties"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <select
                      className={selectCls}
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as MenuType }))}
                    >
                      <option value="category" className="bg-card-bg text-txt-title">Category</option>
                      <option value="custom_url" className="bg-card-bg text-txt-title">Custom URL</option>
                      <option value="website_url" className="bg-card-bg text-txt-title">Website URL</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Parent</Label>
                    <select
                      className={selectCls}
                      value={form.parentId}
                      onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))}
                    >
                      <option value="" className="bg-card-bg text-txt-title">— Top Level —</option>
                      {allCategoryOptions.map((c) => (
                        <option key={c.id} value={c.id} className="bg-card-bg text-txt-title">
                          {"— ".repeat(c.depth)}
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(form.type === "custom_url" || form.type === "website_url") && (
                  <div className="space-y-1.5">
                    <Label>URL</Label>
                    <input
                      className={inputCls}
                      value={form.url}
                      onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                      placeholder={form.type === "custom_url" ? "/properties?intent=rent" : "https://example.com"}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Icon (optional)</Label>
                  <input
                    className={inputCls}
                    value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                    placeholder="e.g. 🏠"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Visibility</Label>
                  <select
                    className={selectCls}
                    value={form.visibility}
                    onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as Visibility }))}
                  >
                    <option value="always" className="bg-card-bg text-txt-title">{VISIBILITY_LABEL.always}</option>
                    <option value="logged_in" className="bg-card-bg text-txt-title">{VISIBILITY_LABEL.logged_in}</option>
                    <option value="logged_out" className="bg-card-bg text-txt-title">{VISIBILITY_LABEL.logged_out}</option>
                    <option value="role" className="bg-card-bg text-txt-title">{VISIBILITY_LABEL.role}</option>
                  </select>
                </div>

                {form.visibility === "role" && (
                  <div className="space-y-1.5">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {PUBLIC_ROLES.map((r) => {
                        const selected = form.roles.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                roles: selected ? p.roles.filter((x) => x !== r) : [...p.roles, r],
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer capitalize ${
                              selected
                                ? "bg-brand text-white border-brand"
                                : "bg-input-bg text-txt-body border-input-border hover:bg-neutral-500/5"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, openInNewTab: !p.openInNewTab }))}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none flex-shrink-0 ${
                        form.openInNewTab ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-850"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          form.openInNewTab ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold text-txt-muted">Open in new tab</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, highlight: !p.highlight }))}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none flex-shrink-0 ${
                        form.highlight ? "bg-brand" : "bg-neutral-500/20 dark:bg-neutral-850"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          form.highlight ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold text-txt-muted">Feature (highlighted CTA)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                      className={`w-9 h-5 rounded-full transition-colors relative outline-none cursor-pointer border-none flex-shrink-0 ${
                        form.isActive ? "bg-emerald-500" : "bg-neutral-500/20 dark:bg-neutral-850"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          form.isActive ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold text-txt-muted">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-txt-body border border-card-border bg-input-bg hover:bg-neutral-500/5 transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:bg-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2 shadow-md shadow-brand/10 border-none"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editingId ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
