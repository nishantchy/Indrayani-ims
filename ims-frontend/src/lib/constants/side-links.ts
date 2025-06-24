import {
  LayoutDashboard,
  Users,
  Boxes,
  Tags,
  Image as ImageIcon,
  BookText,
} from "lucide-react";

const sidelinks = [
  {
    id: 1,
    title: "Dashboard",
    links: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Dealers",
    links: "/dealers",
    icon: Users,
  },
  {
    id: 3,
    title: "Inventory",
    links: "/inventory",
    icon: Boxes,
  },
  {
    id: 4,
    title: "Categories",
    links: "/categories",
    icon: Tags,
  },
  {
    id: 5,
    title: "Media Center",
    links: "/media-center",
    icon: ImageIcon,
  },
  {
    id: 6,
    title: "Ledger",
    links: "/ledger",
    icon: BookText,
  },
];

export default sidelinks;
