import Image from "next/image";

type DashboardNavbarProps = {
    onLogout: () => void;
};

export default function DashboardNavbar({onLogout}: DashboardNavbarProps) {
    return (
        <nav
            id="dashboard-navbar"
            className="w-full py-4 px-6"
            style={{backgroundColor: "#FA481B"}}
        >
            <div className="flex justify-between items-center">
                <div className="flex-1 flex justify-center">
                    <Image
                        src="/Logo Compresso.png"
                        alt="Logo"
                        width={180}
                        height={60}
                        className="object-contain filter invert brightness-0"
                        priority
                    />
                </div>
                <button
                    onClick={onLogout}
                    className="text-white flex flex-col items-center justify-center ml-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span className="text-xs mt-1">Logout</span>
                </button>
            </div>
        </nav>
    );
}