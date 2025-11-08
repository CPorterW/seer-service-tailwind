import type { Finger } from "../types/finger";
import logoSrc from "../assets/transparent-logo-cropped.png";
import { Link } from "react-router-dom";

type DigitsProps = {
  toes?: boolean; // If true, hide logo (footer)
  babyhands?: boolean; // if true, logo at top
};

export function Digits({ toes = false, babyhands = false }: DigitsProps) {
  const fingers: Finger[] = [
    { to: "/", title: "Home" },
    { to: "/calculate", title: "Calculate" },
    { to: "/clients", title: "Clients" },
    {
      to: "/",
      logo: true,
      imgSrc: logoSrc,
      alt: "Seer Service Books logo",
      className: "logo",
    },
    { to: "/vendors", title: "Vendors" },
    { to: "/codes", title: "Codes" },
    { to: "/logout", title: "Sign Out" },
  ];

  const logoFinger = fingers.find((finger) => finger.logo);

  return (
    <nav className={toes ? "toes" : "fingers"}>
      {/* If babyhands, show logo at top */}
      {babyhands && logoFinger && (
        <>
        <Link to={logoFinger.to} className={logoFinger.className || ""}>
          <img src={logoFinger.imgSrc} alt={logoFinger.alt || "logo"} />
        </Link>
        <br /></>
      )}

      {/* Render other fingers (skip logo if toes or babyhands are true) */}
      {fingers
        .filter((digit) => !((babyhands || toes) && digit.logo)) // If toes, skip logo
        .map((digit, index) => (
          <Link
            key={index}
            to={digit.to}
            className={digit.className || ""}
          >
            {digit.logo && digit.imgSrc ? (
              <img src={digit.imgSrc} alt={digit.alt || "logo"} />
            ) : (
              digit.title
            )}
          </Link>
        ))}
    </nav>
  );
}
