 import { useAuth } from "@/auth/AuthContext.jsx";
 import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BusinessProfile() {
  const { user } = useAuth() || {};
  return (
    <div className="bd-container space-y-5">
      <div className="bd-hero">
        <div className="bd-eyebrow">Profile</div>
        <h1 className="bd-title">Edit Profile</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input defaultValue={user?.first_name} placeholder="First name" />
        <Input defaultValue={user?.last_name} placeholder="Last name" />
        <Input defaultValue={user?.email} type="email" className="sm:col-span-2" placeholder="Email" />
        <Input placeholder="New password (optional)" type="password" className="sm:col-span-2" />
      </div>

      <Button disabled className="bg-neutral-800 hover:bg-neutral-700">Save (wire backend when ready)</Button>
    </div>
  );
}
