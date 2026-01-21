"use client";

import { Avatar, IconMenu } from "../../../components/adminUI/icon";
import { useState } from "react";
import ProfileSheet from "./_components/profile";
import { useAuth } from "../../../lib/context/auth-context";

export default function AdminTopbar({ onOpenSidebar }) {
  const [openProfile, setOpenProfile] = useState(false);
  const { user } = useAuth();
  const formatRoleLabel = (roleKey) => {
    if (!roleKey) return '';
    return roleKey
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  }
  const headerTitle = user?.roles && user.roles.length > 0 ? `${formatRoleLabel(user.roles[0])} Area` : 'Dashboard Panel';
  return (
    <div className="flex w-full items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <button onClick={onOpenSidebar} className="lg:hidden p-2 rounded-md hover:bg-zinc-100" aria-label="Open menu">
          <IconMenu className="h-5 w-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">{headerTitle}</h1>
      </div>

      <button aria-label="User menu" onClick={() => setOpenProfile(true)} className="flex items-center justify-center rounded-full bg-zinc-50 h-10 w-10 hover:bg-zinc-100 focus:outline-none focus:ring-0">
        <Avatar
          className="h-8 w-8"
          hoverBorderColor="#3B82F6"
          hoverBorderWidth={1}
          hoverScale={1.08}
          src={user?.avatar || user?.photo || user?.image || user?.profilePicture || ''}
          alt={user?.name || 'User'}
        />
      </button>

      <ProfileSheet open={openProfile} onClose={() => setOpenProfile(false)} />
    </div>
  );
}
