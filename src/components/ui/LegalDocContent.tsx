import type { LegalDoc } from "../../lib/legalDocs";

export default function LegalDocContent({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <h1 className="legal-doc__title">{doc.title}</h1>
      <p className="legal-doc__updated">Última actualización: {doc.updated}</p>

      {doc.blocks.map((block, i) => {
        if ("h" in block) return <h2 key={i}>{block.h}</h2>;
        if ("ul" in block)
          return (
            <ul key={i}>
              {block.ul.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        return <p key={i}>{block.p}</p>;
      })}
    </>
  );
}
