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
        className="self-start rounded text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <span aria-hidden="true">←</span> Back to Drafts
      </Link>
      <Suspense fallback={<p className="text-ink-muted">Loading your draft…</p>}>
        <ItemFromParams params={props.params} />
      </Suspense>
    </div>
  );
}
