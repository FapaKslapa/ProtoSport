import React from "react";
import {useAvatarColor} from "@/app/hooks/useAvatarColor";

interface AvatarProps {
    nome: string;
    cognome: string;
}

const Avatar: React.FC<AvatarProps> = ({nome, cognome}) => {
    const colorClass = useAvatarColor(nome, cognome);
    const iniziali = `${nome[0]}${cognome[0]}`.toUpperCase();

    return (
        <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${colorClass}`}
            aria-label={`Avatar di ${nome} ${cognome}`}
        >
            {iniziali}
        </div>
    );
};

export default Avatar;