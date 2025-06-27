import {useMemo} from "react";

const COLORS = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500",
    "bg-red-500", "bg-orange-500", "bg-teal-500"
];

export function useAvatarColor(nome: string, cognome: string): string {
    return useMemo(() => {
        const hash = (nome + cognome)
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return COLORS[hash % COLORS.length];
    }, [nome, cognome]);
}