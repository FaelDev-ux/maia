"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldOff, ShieldCheck, UsersRound } from "lucide-react";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { fetchAdminUsers, updateAdminUserStatus } from "@/features/admin/services";
import { normalizeAdminSearch } from "@/features/admin/utils";
import type { User, UserProfileCode } from "@/types/user";

const profileLabels: Record<UserProfileCode, string> = {
  ADM: "Admin",
  DSM: "Futura mae",
  MMT: "Mentora",
  PRO: "Profissional",
  PUE: "Mae no puerperio",
};

export function AdminUsersPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const normalizedQuery = normalizeAdminSearch(query);

  async function reloadUsers() {
    setIsLoading(true);
    setError("");

    try {
      setUsers(await fetchAdminUsers());
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel carregar usuarios.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      try {
        const nextUsers = await fetchAdminUsers();

        if (isMounted) {
          setUsers(nextUsers);
        }
      } catch (currentError) {
        if (isMounted) {
          setError(currentError instanceof Error ? currentError.message : "Nao foi possivel carregar usuarios.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (!normalizedQuery) {
          return true;
        }

        return normalizeAdminSearch(`${user.fullName} ${user.email} ${user.profileCode} ${user.status}`).includes(
          normalizedQuery
        );
      }),
    [normalizedQuery, users]
  );

  async function handleStatus(userId: string, status: "active" | "blocked") {
    await updateAdminUserStatus(userId, status);
    await reloadUsers();
  }

  return (
    <AdminShell
      description="Liste contas, acompanhe perfis e bloqueie ou reative acessos quando necessario."
      eyebrow="Gestao"
      title="Usuarios"
    >
      <section aria-label="Busca de usuarios">
        <div className="rounded-[2rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
          <label className="block text-sm font-extrabold text-title" htmlFor="admin-users-search">
            Buscar usuario
          </label>
          <div className="mt-3 flex h-14 items-center gap-3 rounded-full bg-background px-4 ring-1 ring-border/80 focus-within:ring-2 focus-within:ring-primary">
            <Search aria-hidden className="shrink-0 text-primary" size={20} strokeWidth={2.3} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-title outline-none placeholder:text-text/55"
              id="admin-users-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome, e-mail, perfil ou status"
              type="search"
              value={query}
            />
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4" aria-label="Lista de usuarios">
        {isLoading ? (
          <div className="rounded-[1.9rem] bg-white px-6 py-8 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
            <h2 className="font-title text-lg font-extrabold text-title">Carregando usuarios</h2>
          </div>
        ) : error ? (
          <div className="rounded-[1.9rem] bg-primary/10 px-6 py-6 text-sm font-bold leading-6 text-primary">
            {error}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <article
              className="rounded-[1.85rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65"
              key={user.id}
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <UsersRound aria-hidden size={22} strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                      {profileLabels[user.profileCode] ?? user.profileCode}
                    </span>
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-title ring-1 ring-border/75">
                      {user.status}
                    </span>
                  </div>
                  <h2 className="mt-3 font-title text-lg font-extrabold leading-tight text-title">
                    {user.fullName}
                  </h2>
                  <p className="mt-1 break-all text-sm font-semibold text-text">{user.email}</p>
                  {user.profileCode === "PRO" ? (
                    <p className="mt-2 text-xs font-bold text-text/75">
                      Validacao profissional: {user.professionalVerificationStatus}
                    </p>
                  ) : null}
                </div>
              </div>

              <footer className="mt-5 flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
                {user.status === "active" ? (
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-danger px-4 text-sm font-extrabold text-white"
                    onClick={() => void handleStatus(user.id, "blocked")}
                    type="button"
                  >
                    <ShieldOff aria-hidden size={17} strokeWidth={2.3} />
                    Bloquear
                  </button>
                ) : (
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-extrabold text-white"
                    onClick={() => void handleStatus(user.id, "active")}
                    type="button"
                  >
                    <ShieldCheck aria-hidden size={17} strokeWidth={2.3} />
                    Reativar
                  </button>
                )}
              </footer>
            </article>
          ))
        )}
      </section>
    </AdminShell>
  );
}
