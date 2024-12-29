export interface PivotNode {
    year: string;
    description: string;
    actors: PivotActor[];
    possible_outcomes: PivotDecision[];
    narratives?: PivotNarrative[];
    children?: PivotNode[] | null;
}

export interface PivotNarrative {
    viewpoint: "contemporary" | "historian" | "propaganda";
    text: string;
}

export interface PivotActor {
    type: PivotActorType;
    name: string;
    relationships?: PivotRelationship[];
}

export interface PivotDecision {
    actor: PivotActor;
    short_term_ramifications: PivotRamification[];
    long_term_ramifications: PivotRamification[];
    action: string;
}

export interface PivotRamification {
    type: PivotRamificationType;
    affected_actor: PivotActor;
    ramification: string;    
    probability?: number; 
}

export interface PivotRelationship {
    target: PivotActor;
    relationship_type: "ally" | "enemy" | "neutral" | "vassal";
    strength: number;
}

export type PivotRamificationType = "short" | "long";
export type PivotActorType = "nation" | "person" | "alliance";