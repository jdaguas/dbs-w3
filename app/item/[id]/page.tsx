import Link from "next/link";
import { Suspense } from "react";
import { ItemView } from "./ItemView";

// Reading the id from the URL is dynamic, so it sits inside Suspense (like /add).
async function ItemFromParams({ params }: { params: PageProps<"/item/[id]">["params"] }) {
  const { id } = await params;
  return <ItemView id={id} />;
}

export default function ItemPage(props: PageProps<"/item/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="self-start rounded text-sm font-medium text-zinc-700 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      >
        <span aria-hidden="true">←</span> Back to Drafts
      </Link>
      <Suspense fallback={<p className="text-zinc-600">Loading your draft…</p>}>
        <ItemFromParams params={props.params} />
      </Suspense>
    </div>
  );
}
