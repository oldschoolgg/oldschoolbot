import { globalState } from "@/lib/api.js";

export function StaffPage({children}: {children: React.ReactNode}) {
    const user = globalState((s) => s.user);

    if (!user || ![1,2].some(_b => user.bits.includes(_b))) {
        return <p>You are not staff.</p>;
    }

    return (
        <div>
            <h1>Staff</h1>
            {children}
        </div>
    )
}
