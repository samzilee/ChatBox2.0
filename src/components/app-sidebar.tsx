import * as React from "react";
import webIcon from "@/Assets/websiteIcon2.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();

  const path = useLocation().pathname;

  // This is sample data.
  const data = {
    navMain: [
      {
        title: "Channels",
        url: "#",
        items: [
          {
            title: "Status",
            url: "/",
            isActive: path === "/" ? true : false,
          },
          {
            title: "Chat-Room",
            url: "/channels/chatroom",
            isActive: path === "/channels/chatroom" ? true : false,
          },
        ],
      },
      {
        title: "Private Rooms",
        url: "#",
        items: [
          {
            title: "crazy shit room",
            url: "#",
            isActive: false,
          },
          {
            title: "hitler convo",
            url: "#",
            isActive: false,
          },
        ],
      },
    ],
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="w-full">
                  <img src={webIcon} alt="Website Icon" width={150} />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}

        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      onClick={() => handleMenuClick()}
                      className="font-semibold"
                    >
                      <NavLink to={item.url}>{item.title}</NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
