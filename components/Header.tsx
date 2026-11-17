'use client'
import { useEffect, useState, MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material'
import { FiLogOut, FiSearch, FiUser } from 'react-icons/fi'
import { useSettings } from '@/config/useSettings'
import { useAuth } from '@/hooks/useAuth'
import { destroySession } from '@/lib/session'
import { queryClient } from '@/lib/queryClient'
import { LogoMark } from './brand/Logo'
import ThemeToggle from './theme/ThemeToggle'
import GlobalSearch from './search/GlobalSearch'
import { useCurrencyContext } from './currency/CurrencyProvider'

const DEFAULT_LOGO = '/brand/industra-mark.svg'

export const Header = () => {
  const { primaryColour, org, isPending } = useSettings();
  const { user } = useAuth();
  const { active, openPicker, isLoading: currencyLoading } = useCurrencyContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const logout = async () => {
    setAccountAnchor(null);
    queryClient.clear();
    await destroySession();
  };

  if (isPending) return <header className='h-14 w-full' style={{ backgroundColor: primaryColour }} />

  const orgLogo = org?.logo && org.logo !== DEFAULT_LOGO ? org.logo : null;
  const iconBtn = { color: '#fff', '&:hover': { backgroundColor: 'rgb(255 255 255 / 0.14)' } };

  return (
    <header
      style={{ backgroundColor: primaryColour || 'var(--brand-from)' }}
      className='sticky top-0 z-30 flex h-14 w-full flex-row items-center justify-between gap-2 px-3 text-white shadow-sm md:px-4'
    >
      <Link className='flex min-w-0 flex-row items-center gap-2' href='/dashboard' aria-label='Go to dashboard'>
        {orgLogo ? (
          <Image className='rounded-full bg-white/10 object-cover' src={orgLogo} alt={`${org?.name ?? 'Organization'} logo`} width={34} height={34} />
        ) : (
          <LogoMark size={34} />
        )}
        <span className='truncate text-lg font-bold tracking-tight md:text-xl'>{org?.appName || 'Industra'}</span>
      </Link>

      <div className='flex flex-row items-center gap-1 md:gap-2'>
        {/* Search: icon on phones, wide button with shortcut hint on desktop */}
        <button
          type='button'
          onClick={() => setSearchOpen(true)}
          className='hidden h-9 w-64 cursor-pointer items-center gap-2 rounded-lg bg-white/15 px-3 text-sm text-white/85 transition-colors hover:bg-white/25 md:flex'
          aria-label='Search'
        >
          <FiSearch />
          <span className='flex-1 text-left'>Search…</span>
          <span className='rounded border border-white/30 px-1.5 text-[0.7rem] leading-5'>{isMac ? '⌘' : 'Ctrl'} K</span>
        </button>
        <Tooltip title='Search'>
          <IconButton aria-label='Search' onClick={() => setSearchOpen(true)} sx={{ ...iconBtn, display: { md: 'none' } }}>
            <FiSearch size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title={active ? `Entering amounts in ${active.name}. Click to change` : 'Select currency'}>
          <button
            type='button'
            onClick={openPicker}
            aria-label='Select currency'
            className='flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold transition-colors hover:bg-white/15'
          >
            {currencyLoading ? '…' : (active?.symbol || '¤')}
            <span className='hidden text-xs font-normal opacity-80 lg:inline'>{active?.name}</span>
          </button>
        </Tooltip>

        <ThemeToggle />

        <Tooltip title='Account'>
          <IconButton aria-label='Account menu' onClick={(e: MouseEvent<HTMLElement>) => setAccountAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar src={user?.photo || undefined} alt={user?.name} sx={{ width: 32, height: 32, border: '2px solid rgb(255 255 255 / 0.6)' }}>
              {user?.name?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={accountAnchor}
          open={!!accountAnchor}
          onClose={() => setAccountAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
        >
          <div className='px-4 py-2'>
            <div className='truncate text-sm font-semibold'>{user?.name}</div>
            <div className='truncate greyText2'>{user?.email}</div>
          </div>
          <Divider />
          <MenuItem component={Link} href='/dashboard/config/profile' onClick={() => setAccountAnchor(null)}>
            <ListItemIcon><FiUser /></ListItemIcon>
            My account
          </MenuItem>
          <MenuItem onClick={logout}>
            <ListItemIcon><FiLogOut /></ListItemIcon>
            Log out
          </MenuItem>
        </Menu>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
