import { Response, Request } from "express";
import { z } from "zod";
import { MenuItem, IMenuItem } from "../models/MenuItem";
import { AuthRequest } from "../middleware/auth";

const menuItemSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["category", "custom_url", "website_url"]),
  url: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  highlight: z.boolean().optional(),
  icon: z.string().optional(),
  visibility: z.enum(["always", "logged_in", "logged_out", "role"]).optional(),
  roles: z.array(z.string()).optional(),
});

type MenuNode = Record<string, unknown> & {
  _id: string;
  parentId: string | null;
  order: number;
  children: MenuNode[];
};

function buildTree(items: IMenuItem[]): MenuNode[] {
  const byId = new Map<string, MenuNode>();
  items.forEach((item) => {
    const plain = item.toObject();
    byId.set(item._id.toString(), {
      ...plain,
      _id: item._id.toString(),
      parentId: item.parentId ? item.parentId.toString() : null,
      children: [],
    });
  });

  const roots: MenuNode[] = [];
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

// Public: active menu tree (visibility filtering happens client-side based on auth state)
export async function getPublicMenu(req: Request, res: Response): Promise<void> {
  const items = await MenuItem.find({ isActive: true }).sort({ order: 1 });
  res.json(buildTree(items));
}

// Admin: full flat list (including inactive) for the tree-builder UI
export async function getAdminMenu(req: AuthRequest, res: Response): Promise<void> {
  const items = await MenuItem.find({}).sort({ order: 1 });
  res.json(items);
}

export async function createMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const count = await MenuItem.countDocuments({ parentId: parsed.data.parentId ?? null });
  const item = await MenuItem.create({
    ...parsed.data,
    parentId: parsed.data.parentId ?? null,
    order: parsed.data.order ?? count,
    createdBy: req.userId,
  });
  res.status(201).json(item);
}

export async function updateMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const parsed = menuItemSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const item = await MenuItem.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!item) { res.status(404).json({ error: "Menu item not found" }); return; }
  res.json(item);
}

// Recursively delete a menu item and all its descendants
async function deleteWithDescendants(id: string): Promise<void> {
  const children = await MenuItem.find({ parentId: id }, "_id");
  await Promise.all(children.map((c) => deleteWithDescendants(c._id.toString())));
  await MenuItem.findByIdAndDelete(id);
}

export async function deleteMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const item = await MenuItem.findById(req.params.id);
  if (!item) { res.status(404).json({ error: "Menu item not found" }); return; }
  await deleteWithDescendants(String(req.params.id));
  res.json({ message: "Deleted" });
}

const reorderSchema = z.array(
  z.object({
    id: z.string(),
    parentId: z.string().nullable(),
    order: z.number(),
  })
);

// Persists the full drag-and-drop tree state (parent + order) in one call
export async function reorderMenu(req: AuthRequest, res: Response): Promise<void> {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  await Promise.all(
    parsed.data.map((entry) =>
      MenuItem.findByIdAndUpdate(entry.id, { parentId: entry.parentId, order: entry.order })
    )
  );
  const items = await MenuItem.find({}).sort({ order: 1 });
  res.json(items);
}
