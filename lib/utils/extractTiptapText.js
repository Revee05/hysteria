export function extractTextFromTiptap(content) {
  if (!content) return "";

  // jika content masih string
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return "";
    }
  }

  let text = "";

  const walk = (node) => {
    if (!node) return;

    if (node.type === "text" && node.text) {
      text += node.text + " ";
    }

    if (node.content) {
      node.content.forEach(walk);
    }
  };

  walk(content);

  return text.trim();
}