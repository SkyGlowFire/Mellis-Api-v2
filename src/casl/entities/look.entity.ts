type LookOrientation = 'horizontal' | 'vertical'

export class Look{
    _id: string
    orientation: LookOrientation
    enable: boolean
    image: string
    items: string[]
}