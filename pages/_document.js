import Document, { Html, Head, Main, NextScript } from "next/document";
import { MagicScriptTag } from "@Theme/inlineCSSVariables";

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html>
                <Head />
                <body>
                    <MagicScriptTag />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
