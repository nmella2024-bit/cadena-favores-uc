import React from 'react';

const SkeletonCard = () => (
    <div
        className="animate-pulse rounded-xl border border-border bg-card/70 p-5 shadow-sm dark:bg-card/60"
        data-testid="favor-skeleton"
    >
        <div className="h-6 w-2/3 rounded bg-border/80 dark:bg-border/40" />
        <div className="mt-4 flex gap-3">
            <div className="h-4 w-24 rounded-full bg-border/80 dark:bg-border/40" />
            <div className="h-4 w-20 rounded-full bg-border/80 dark:bg-border/40" />
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-border/80 dark:bg-border/40" />
            <div className="h-4 w-5/6 rounded bg-border/80 dark:bg-border/40" />
            <div className="h-4 w-2/3 rounded bg-border/80 dark:bg-border/40" />
        </div>
        <div className="mt-6 flex gap-3">
            <div className="h-9 w-32 rounded-lg bg-border/80 dark:bg-border/40" />
            <div className="h-9 w-24 rounded-lg bg-border/80 dark:bg-border/40" />
        </div>
    </div>
);

export default SkeletonCard;
