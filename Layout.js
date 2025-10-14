import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, LayoutDashboard, Ticket, Plus, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const publicPages = ["Events", "EventDetails"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const isPublicPage = publicPages.includes(currentPageName);
  const isOrganizer = user?.user_role === "organizer" || user?.user_role === "admin";

  const navigationItems = [
    {
      title: "Browse Events",
      url: createPageUrl("Events"),
      icon: Calendar,
      show: true,
    },
    {
      title: "My Bookings",
      url: createPageUrl("MyBookings"),
      icon: Ticket,
      show: !!user,
    },
    {
      title: "Create Event",
      url: createPageUrl("CreateEvent"),
      icon: Plus,
      show: isOrganizer,
    },
    {
      title: "My Events",
      url: createPageUrl("MyEvents"),
      icon: LayoutDashboard,
      show: isOrganizer,
    },
  ].filter(item => item.show);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <style>
        {`
          :root {
            --primary: 263 70% 50%;
            --primary-foreground: 0 0% 100%;
            --accent: 45 93% 47%;
          }
        `}
      </style>

      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-r border-purple-100 bg-white/80 backdrop-blur-xl">
            <SidebarHeader className="border-b border-purple-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900">EventHub</h2>
                  <p className="text-xs text-purple-600">Premium Events</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {user && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                    Account
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-3 py-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{user.user_role}</span>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>

            <SidebarFooter className="border-t border-purple-100 p-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all shadow-md"
                >
                  Sign In
                </button>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-6 py-4 md:hidden sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-purple-50 p-2 rounded-lg transition-colors" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  EventHub
                </h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}