import type { AnchorHTMLAttributes } from "react";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function ExternalLink({ href, rel, target, ...props }: ExternalLinkProps) {
  const externalProps = getExternalLinkProps(href, target, rel);

  return <a href={href} {...externalProps} {...props} />;
}

export function getExternalLinkProps(href: string, target?: string, rel?: string) {
  if (!isExternalUrl(href)) {
    return { rel, target };
  }

  return {
    rel: rel ?? "noopener noreferrer",
    target: target ?? "_blank",
  };
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}
