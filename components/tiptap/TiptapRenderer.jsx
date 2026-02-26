"use client";

export default function TiptapRenderer({ content }) {
  if (!content || !content.content) return null;

  const renderMarks = (textNode, index) => {
    let element = textNode.text;

    if (textNode.marks) {
      textNode.marks.forEach((mark) => {
        switch (mark.type) {
          case "bold":
            element = <strong key={index}>{element}</strong>;
            break;

          case "italic":
            element = <em key={index}>{element}</em>;
            break;

          case "underline":
            element = <u key={index}>{element}</u>;
            break;

          case "strike":
            element = <s key={index}>{element}</s>;
            break;

          case "link":
            element = (
              <a
                key={index}
                href={mark.attrs?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 underline hover:opacity-80"
              >
                {element}
              </a>
            );
            break;

          default:
            break;
        }
      });
    }

    return element;
  };

  const renderNode = (node, index) => {
    switch (node.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-6 leading-relaxed text-gray-800">
            {node.content?.map(renderNode)}
          </p>
        );

      case "text":
        return renderMarks(node, index);

      case "heading":
        const level = node.attrs?.level || 1;
        const Tag = `h${level}`;

        const headingStyles = {
          1: "text-4xl font-bold mt-10 mb-6",
          2: "text-3xl font-bold mt-8 mb-5",
          3: "text-2xl font-semibold mt-6 mb-4",
          4: "text-xl font-semibold mt-6 mb-4",
        };

        return (
          <Tag key={index} className={headingStyles[level]}>
            {node.content?.map(renderNode)}
          </Tag>
        );

      case "image":
        return (
          <figure key={index} className="my-10">
            <img
              src={node.attrs?.src}
              alt={node.attrs?.alt || ""}
              className="rounded-xl object-cover max-h-[480px] mx-auto"
            />
            {node.attrs?.title && (
              <figcaption className="text-sm text-gray-500 mt-2 text-center">
                {node.attrs.title}
              </figcaption>
            )}
          </figure>
        );

      case "bulletList":
        return (
          <ul key={index} className="list-disc pl-6 mb-6 space-y-2">
            {node.content?.map(renderNode)}
          </ul>
        );

      case "orderedList":
        return (
          <ol key={index} className="list-decimal pl-6 mb-6 space-y-2">
            {node.content?.map(renderNode)}
          </ol>
        );

      case "listItem":
        return <li key={index}>{node.content?.map(renderNode)}</li>;

      case "blockquote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-pink-400 pl-4 italic my-6 text-gray-700"
          >
            {node.content?.map(renderNode)}
          </blockquote>
        );

      case "hardBreak":
        return <br key={index} />;

      default:
        return null;
    }
  };

  return (
    <div className="article-content">
      {content.content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
