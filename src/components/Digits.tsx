import type { Finger } from "../types/finger";
import logoSrc from "../assets/transparent-logo-cropped.png";

type DigitsProps = {
  toes?: boolean; // If true, hide logo (footer)
  babyhands?: boolean; // if true, logo at top
};

export function Digits({ toes = false, babyhands = false }: DigitsProps) {

  const fingers: Finger[] = [
    { url: "index.html", title: "Home" },
    { url: "codes.html", title: "Codes" },
    { url: "vendors.html", title: "Vendors" },
    {
      url: "index.html",
      logo: true,
      imgSrc: logoSrc,
      alt: "Seer Service Books logo",
      className: "logo",
    },
    { url: "account.html", title: "Account" },
    { url: "about.html", title: "About" },
    { url: "login.html", title: "Login" },
  ];

  const logoFinger = fingers.find((finger) => finger.logo);

  return (
    <nav className={toes ? "toes" : "fingers"}>
      {/* If babyhands, show logo at top */}
      {babyhands && logoFinger && (
        <>
        <a href={logoFinger.url} className={logoFinger.className || ""}>
          <img src={logoFinger.imgSrc} alt={logoFinger.alt || "logo"} />
        </a>
        <br /></>
      )}

      {/* Render other fingers (skip logo if toes or babyhands are true) */}
      {fingers
        .filter((digit) => !((babyhands || toes) && digit.logo)) // If toes, skip logo
        .map((digit, index) => (
          <a
            key={index}
            href={digit.url}
            className={digit.className || ""}
          >
            {digit.logo && digit.imgSrc ? (
              <img src={digit.imgSrc} alt={digit.alt || "logo"} />
            ) : (
              digit.title
            )}
          </a>
        ))}
    </nav>
  );
}
