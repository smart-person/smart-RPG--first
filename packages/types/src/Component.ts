export type LayoutOptions = {
    width?: number,
    height?: number,
    marginBottom?: number,
}

export type ComponentObject<T> = { id: string, value: T }

type LayoutPosition<T> = {
    lines: { col: ComponentObject<T>[] }[],
} & LayoutOptions

export type LayoutObject<T> = {
    top: LayoutPosition<T>,
    bottom: LayoutPosition<T>,
    left: LayoutPosition<T>,
    right: LayoutPosition<T>
    center: LayoutPosition<T>
}


export type TextComponentObject = {
    id: 'text',
    value: {
        text: string,
        margin?: number,
        height?: number,
        style?: {
            opacity?: number,
            fill?: string,
            align?: 'left' | 'center' | 'right' | 'justify',
            wordWrap?: boolean,
            fontSize?: number | string,
            fontFamily?: string | string[],
            stroke?: string,
            fontStyle?: 'normal' | 'italic' | 'oblique',
            fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
        }
    } | string
}

type BarComponentStyle = {
    bgColor?: string,
    fillColor?: string,
    borderColor?: string,
    borderWidth?: number,
    height?: number,
    width?: number,
    borderRadius?: number,
    opacity?: number
}

export type BarComponentObject = {
    id: 'bar',
    value: {
        current: string,
        max: string,
        style?: BarComponentStyle | {
            perPercent: {
                [percent: string]: {
                    fillColor?: string
                }
            } 
        } & BarComponentStyle
    }
}