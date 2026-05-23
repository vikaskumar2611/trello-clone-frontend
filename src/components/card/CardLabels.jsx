export default function CardLabels({ labels = [], compact = false }) {
    if (!labels.length) return null;

    return (
        <div className="flex flex-wrap gap-1 mb-1.5">
            {labels.map((label) => (
                <span
                    key={label.id}
                    title={label.name}
                    className={`rounded ${compact ? "h-2 w-8" : "h-2 w-10"}
                      inline-block`}
                    style={{ backgroundColor: label.color }}
                />
            ))}
        </div>
    );
}
