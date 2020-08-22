import Terser from "terser";
import { COLORS } from "./main.style";

export function setColorsByTheme() {
    document.body.firstChild.remove();
    const colors = "🌈";

    function getInitialColorMode() {
        const persistedColorPreference = window.localStorage.getItem(
            "color-mode"
        );
        const hasPersistedPreference =
            typeof persistedColorPreference === "string";
        // If the user has explicitly chosen light or dark,
        // let's use it. Otherwise, this value will be null.
        if (hasPersistedPreference) {
            return persistedColorPreference;
        }
        // If they haven't been explicit, let's check the media
        // query
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const hasMediaQueryPreference = typeof mql.matches === "boolean";
        if (hasMediaQueryPreference) {
            return mql.matches ? "dark" : "light";
        }
        // If they are using a browser/OS that doesn't support
        // color themes, let's default to 'light'.
        return "light";
    }

    const colorMode = getInitialColorMode();

    const root = document.documentElement;

    root.style.setProperty("--initial-color-mode", colorMode);
    Object.entries(colors).forEach(([name, colorByTheme]) => {
        const cssVarName = `--${name}`;

        root.style.setProperty(cssVarName, colorByTheme[colorMode]);
    });
}

export function MagicScriptTag() {
    const boundFn = String(setColorsByTheme).replace(
        '"🌈"',
        JSON.stringify(COLORS)
    );

    let calledFunction = `(${boundFn})()`;

    calledFunction = Terser.minify(calledFunction).code;

    // eslint-disable-next-line react/no-danger
    return <script dangerouslySetInnerHTML={{ __html: calledFunction }} />;
}

// if user doesn't have JavaScript enabled, set variables properly in a
// head style tag anyways (light mode)
export function FallbackStyles() {
    const cssVariableString = Object.entries(COLORS).reduce(
        (acc, [name, colorByTheme]) => {
            return `${acc}\n--color-${name}: ${colorByTheme.light};`;
        },
        ""
    );

    const wrappedInSelector = `html { ${cssVariableString} }`;

    return <style>{wrappedInSelector}</style>;
}
