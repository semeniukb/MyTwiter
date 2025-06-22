import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="justify-start p-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-6 w-6" />
          <span className="ml-2">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-6 w-6" />
          <span className="ml-2">Dark Mode</span>
        </>
      )}
    </Button>
  );
}
