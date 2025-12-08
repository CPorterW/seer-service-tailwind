
type LinkProps = {
  link: string;
  text: string;
};
export function TextLink({ link, text }: LinkProps ) {
    return <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 visited:text-navy-700" style={{ display: "inline", margin: 0, padding: 0 }}>{text}</a>
}