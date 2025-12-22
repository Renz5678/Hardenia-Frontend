import { useState } from 'react';
import styles from './ToolBox.module.css'
import NormalWateringCan from './Tools/WateringCan/watering can.png'
import PouringWateringCan from './Tools/WateringCan/wc pouring.png'
import Fertilizer from './Tools/Fertilizer/fertilizer-1.png'
import ClosedScissors from './Tools/Pruning/close.png'
import OpenScissors from './Tools/Pruning/open.png'
import NormalSprayCan from './Tools/Pesticide/nospray.png'
import SprayingSprayCan from './Tools/Pesticide/spray bottle spraying.png'
import CleanShovel from './Tools/Repot/shovel (clean).png'
import DirtyShovel from './Tools/Repot/shovel (dirty).png'

export function ToolBox() {
    // Define your tools with their data
    const tools = [
        {
            id: 'watering-can',
            name: 'Watering Can',
            normalImage: NormalWateringCan,
            activeImage: PouringWateringCan,
            toolType: 'water'
        },
        {
            id: 'fertilizer',
            name: 'Fertilizer',
            normalImage: Fertilizer,
            activeImage: Fertilizer,
            toolType: 'fertilize'
        },
        {
            id: 'scissors',
            name: 'Pruning Scissors',
            normalImage: ClosedScissors,
            activeImage: OpenScissors,
            toolType: 'prune'
        },
        {
            id: 'spray-can',
            name: 'Spray Can',
            normalImage: NormalSprayCan,
            activeImage: SprayingSprayCan,
            toolType: 'spray'
        },
        {
            id: 'shovel',
            name: 'Shovel',
            normalImage: CleanShovel,
            activeImage: DirtyShovel,
            toolType: 'repot'
        }
    ];

    // Handler for when dragging starts
    const handleDragStart = (e, tool) => {
        // Store the tool type in the drag data
        e.dataTransfer.setData('toolType', tool.toolType);
        e.dataTransfer.setData('toolId', tool.id);

        // Optional: Make the drag image semi-transparent
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className={styles.toolBox}>
            {tools.map(tool => (
                <img
                    key={tool.id}
                    src={tool.normalImage}
                    alt={tool.name}
                    className={styles.tools}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, tool)}
                    style={{ cursor: 'grab' }}
                />
            ))}
        </div>
    );
}