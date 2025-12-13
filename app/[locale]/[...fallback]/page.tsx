import { ReactNode } from "react";
import { notFound } from "next/navigation";

export default function CatchAllPage(): ReactNode {
  notFound();
}
