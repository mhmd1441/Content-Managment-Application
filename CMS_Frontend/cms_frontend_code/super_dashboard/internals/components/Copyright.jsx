import * as React from 'react';
import { Link  } from "react-router-dom";
export default function Copyright({
  className = "",
  to,                  
  href = "https://Touch.com/",
  brand = "Touch",
  ...rest
}) {
  const BrandLink = to
    ? <Link to={to} className="underline hover:text-gray-700">{brand}</Link>
    : <a href={href} target="_blank" rel="noreferrer" className="underline hover:text-gray-700">{brand}</a>;

  return (
    <p className={`text-sm text-gray-500 text-center ${className}`} {...rest}>
      {"Copyright © "} 
      {BrandLink}{" "}
      {new Date().getFullYear()}
      {"."}
    </p>
  );
}