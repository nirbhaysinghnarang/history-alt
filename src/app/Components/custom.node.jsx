import React, { useState, useEffect} from 'react';
import { Handle, Position } from 'reactflow';
import { PersonStanding, Flag, Group, ArrowRight, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const getActorIcon = (type) => {
    if(!type) return 
    const commonProps = {
        size: 16,
        strokeWidth: 1.5,
        color: '#444444'
    };

    switch (type.toLowerCase()) {
        case 'person': return <PersonStanding {...commonProps} />;
        case 'nation': return <Flag {...commonProps} />;
        case 'alliance': return <Group {...commonProps} />;
        default: return null;
    }
};

const RelationshipBadge = ({ relationship }) => (
    relationship ? (
        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200">
            <span className="font-medium">{relationship?.target?.name ?? "Loading"}</span>
            <span className="text-gray-500">({relationship.relationship_type})</span>
            <span className="text-gray-400">• {relationship.strength}</span>
        </div>
    ) : null
);
const RamificationCard = ({ ramification }) => (
    <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs">
        {ramification.type === 'short' ? <Clock size={14} /> : <TrendingUp size={14} />}
        {ramification.affected_actor && <div className="flex-1">
            <div className="font-medium">{ramification.affected_actor.name}</div>
            <div className="text-gray-600">{ramification.ramification}</div>
        </div>}

    </div>
);

const CustomNode = ({ data, selected }) => {
    const [isExpanded, setIsExpanded] = useState(!!data['isNewNode']);

    
    // Add useEffect to track changes to isNewNode
    useEffect(() => {
        setIsExpanded(!!data['isNewNode']);
    }, [data['isNewNode']]);

    const shouldExpand = isExpanded;



    return (
        <div
            className={`bg-gray-50 border border-gray-300 font-serif relative transition-all duration-200 ease-in-out ${shouldExpand ? 'w-96' : 'w-64'
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 border-2 border-gray-600 bg-gray-100"
            />

            {/* Always visible content */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-medium text-gray-800">{data.year}</div>
                    {shouldExpand ?
                        <ChevronUp size={20} className="text-gray-500" /> :
                        <ChevronDown size={20} className="text-gray-500" />
                    }
                </div>

                <div className="text-sm leading-relaxed text-gray-700 mb-3">
                    {data.description}
                </div>

                {/* Preview of actors (always visible) */}
                {data.actors && (
                    <div className="flex flex-wrap gap-2">
                        {data.actors.map((actor, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                                {getActorIcon(actor.type)}
                                <span>{actor.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Expandable content */}
            {shouldExpand && (
                <div className="px-4 pb-4 border-t border-gray-200">
                    {/* Actors with Relationships */}
                    {data.actors?.some(actor => actor.relationships?.length > 0) && (
                        <div className="mt-3 mb-4">
                            <div className="text-sm font-medium mb-2">Relationships</div>
                            <div className="space-y-2">
                                {data.actors.map((actor, idx) => (
                                    actor.relationships?.length > 0 && (
                                        <div key={idx} className="pl-2">
                                            <div className="flex flex-wrap gap-2">
                                                {actor.relationships.map((rel, ridx) => (
                                                    <RelationshipBadge key={ridx} relationship={rel} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Possible Outcomes */}
                    {data.possible_outcomes?.length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Possible Outcomes</div>
                            <div className="space-y-3">
                                {data.possible_outcomes.map((outcome, idx) => (


                                    <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                        <div className="flex items-center gap-2 text-sm">
                                            <ArrowRight size={14} />
                                          <span className="font-medium">{outcome.actor?.name ?? 'Loading'}:</span>
                                            <span className="text-gray-600">{outcome.action ?? 'No Action Specified'}</span>
                                        </div>

                                        <div className="space-y-2 mt-2">
                                            {outcome.short_term_ramifications?.map((ram, ridx) => (
                                                <RamificationCard key={`st-${ridx}`} ramification={ram} />
                                            ))}
                                            {outcome.long_term_ramifications?.map((ram, ridx) => (
                                                <RamificationCard key={`lt-${ridx}`} ramification={ram} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Narratives */}
                    {data.narratives?.length > 0 && (
                        <div>
                            <div className="text-sm font-medium mb-2">Perspectives</div>
                            <div className="space-y-2">
                                {data.narratives.map((narrative, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-500 mb-1">
                                            {narrative.viewpoint}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {narrative.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 border-2 border-gray-600 bg-gray-100"
            />
        </div>
    );
};

export default CustomNode;