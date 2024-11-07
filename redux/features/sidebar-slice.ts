import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface AccordionLink {
  href: string
  label: string
}

export interface SidebarState {
  gameLinks: AccordionLink[]
}

const initialState: SidebarState = {
  gameLinks: []
}

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    addLink: (state: SidebarState, action: PayloadAction<AccordionLink>): void => {
      const isLinkExists: boolean = state.gameLinks.some((link: AccordionLink) => link.href === action.payload.href)
      if (!isLinkExists) state.gameLinks.push(action.payload)
    },
    addLinks: (state: SidebarState, action: PayloadAction<AccordionLink[]>): void => {
      action.payload.forEach((newLink: AccordionLink) => {
        const isLinkExists: boolean = state.gameLinks.some((link: AccordionLink) => link.href === newLink.href)
        if (!isLinkExists) state.gameLinks.push(newLink)
      })
    },
    removeLink: (state: SidebarState, action: PayloadAction<string>): void => {
      state.gameLinks = state.gameLinks.filter((link: AccordionLink) => !link.href.startsWith(action.payload))
    },
    resetLinks: (state: SidebarState): void => {
      state.gameLinks = []
    }
  }
})

export const { addLink, addLinks, removeLink, resetLinks } = sidebarSlice.actions
export default sidebarSlice.reducer
