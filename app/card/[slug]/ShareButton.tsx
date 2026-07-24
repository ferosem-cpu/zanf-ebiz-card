"use client";

type Props = {
  name: string;
  designation: string;
  url: string;
};

export default function ShareButton({ name, designation, url }: Props) {
  async function handleShare() {
    const shareData = {
      title: `${name} - Zan-F Power Systems`,
      text: `${name}, ${designation} at Zan-F Power Systems`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet - nothing to do.
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      window.alert("Link copied to clipboard.");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full rounded-xl border border-[var(--line-strong)] bg-transparent py-3 text-sm font-medium text-paper transition hover:border-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
    >
      Share card
    </button>
  );
}
