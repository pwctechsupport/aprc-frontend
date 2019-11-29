import { useEffect, ReactElement } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ children }: { children: ReactElement }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
};

export default ScrollToTop;
