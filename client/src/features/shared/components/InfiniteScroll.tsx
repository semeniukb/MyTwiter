import React, { useEffect } from "react";

type InfiniteScrollProps = {
  children: React.ReactNode;
  onLoadMore: () => void;
  threshold?: number;
};

export function InfiniteScroll({
  children,
  onLoadMore,
  threshold = 500,
}: InfiniteScrollProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` },
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, [contentRef, onLoadMore, threshold]);

  return (
    <>
      <div>{children}</div>
      <div ref={contentRef} className="h-1"></div>
    </>
  );
}
