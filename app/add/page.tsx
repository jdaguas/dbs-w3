import Link from "next/link";
import { Suspense } from "react";
import { CHANNELS, type Channel } from "@/lib/items";
import { AddForm } from "./AddForm";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Quick-add and the first-visit chips carry over what was typed (?who=Mom&channel=text).
// Reading the URL is dynamic, so it sits inside Suspense and the rest of the page stays static.
async function PrefilledForm({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const who = first(params.who) ?? "";
  const channelParam = first(params.channel);
  const channel = CHANNELS.some((c) => c.value === channelParam) ? (channelParam as Channel) : "";
  return <AddForm initialWho={who} initialChannel={channel} />;
}

export default function AddPage(props: PageProps<"/add">) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="self-start rounded text-sm font-medium text-zinc-700 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      >
        <span aria-hidden="true">←</span> Back to Drafts
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Who do you owe a reply?</h1>
        <p className="mt-1 text-zinc-700">Log it now, write the reply when you have a minute.</p>
      </div>
      <Suspense fallback={<p className="text-zinc-600">Loading form…</p>}>
        <PrefilledForm searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
