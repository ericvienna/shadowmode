import { ExternalLink } from 'lucide-react';

interface SourceLinkProps {
  url: string;
  label?: string;
}

export function SourceLink({ url, label = 'SRC' }: SourceLinkProps) {
  if (!url?.startsWith('http')) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wide text-cyan-500/80 hover:text-cyan-400 transition-colors"
      title={url}
    >
      {label}
      <ExternalLink className="w-2.5 h-2.5" />
    </a>
  );
}