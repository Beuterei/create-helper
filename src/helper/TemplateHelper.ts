import { Liquid } from 'liquidjs';
import { LiquidOptions } from 'liquidjs/dist/liquid-options';
import { defaultLiquidOptions } from '../config/defaultOptions';

// Class for all template related stuff. Wrapper class to have a somewhat replaceable interface
export class TemplateHelper {
    private liquid: Liquid;

    constructor(options: LiquidOptions = {}) {
        this.liquid = new Liquid({ ...defaultLiquidOptions, ...options });
    }

    /** Register a new tag */
    public registerTag(...args: Parameters<Liquid['registerTag']>) {
        this.liquid.registerTag(...args);
    }

    /** Register a new filter */
    public registerFilter(...args: Parameters<Liquid['registerFilter']>) {
        this.liquid.registerFilter(...args);
    }

    /** Renders a string with values */
    public parseAndRender(...args: Parameters<Liquid['parseAndRender']>) {
        return this.liquid.parseAndRender(...args);
    }

    /** Renders a file with values. Root is used for path finding */
    public renderFile(...args: Parameters<Liquid['renderFile']>) {
        return this.liquid.renderFile(...args);
    }
}
