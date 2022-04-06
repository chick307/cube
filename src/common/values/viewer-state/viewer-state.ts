// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViewerStateTypes {}

export type ViewerStateInstanceTypes = {
    [Type in keyof ViewerStateTypes]: (
        ViewerStateTypes[Type] extends { prototype: infer InstanceType; } ? InstanceType :
        never
    );
};

export type ViewerStateJsonTypes = {
    [Type in keyof ViewerStateInstanceTypes]: (
        ViewerStateInstanceTypes[Type] extends { toJson(): infer Json; } ? Json :
        never
    );
};

export type ViewerStateJson = ViewerStateJsonTypes[keyof ViewerStateJsonTypes];

const viewerStateTypes = {} as Partial<ViewerStateTypes>;

export const defineViewerState = <
    Type extends keyof ViewerStateTypes,
    Implementation extends ViewerStateTypes[Type],
>(
    type: Type,
    implementation: Implementation,
): void => {
    viewerStateTypes[type] = implementation;
};

export abstract class ViewerState {
    static fromJson<Type extends keyof ViewerStateTypes>(json: ViewerStateJsonTypes[Type]): (
        ViewerStateInstanceTypes[Type]
    );

    static fromJson(json: unknown): ViewerState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any): ViewerState {
        if (json == null || typeof json.type !== 'string')
            throw Error();
        const viewerStateType = viewerStateTypes[json.type as keyof ViewerStateTypes];
        if (viewerStateType == null)
            throw Error();
        const viewerState = viewerStateType.fromJson(json);
        return viewerState;
    }

    abstract get type(): string;

    abstract toJson(): ViewerStateJson;
}
