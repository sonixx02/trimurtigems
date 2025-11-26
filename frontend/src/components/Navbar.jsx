import { useState } from 'react'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = {
  Diamonds: [
    { title: 'Shop by Shape', items: [
      { name: 'Round', path: '/diamonds/round' },
      { name: 'Princess', path: '/diamonds/princess' },
      { name: 'Cushion', path: '/diamonds/cushion' },
      { name: 'Oval', path: '/diamonds/oval' },
      { name: 'Emerald', path: '/diamonds/emerald' },
      { name: 'Pear', path: '/diamonds/pear' },
    ]},
    { title: 'Learn', items: [
      { name: '4Cs Education', path: '/education/4cs' },
      { name: 'Diamond Shapes', path: '/education/shapes' }
    ]}
  ],
  Jewelry: [
    { title: 'Categories', items: [
      { name: 'Rings', path: '/jewelry?category=Ring' },
      { name: 'Necklaces', path: '/jewelry?category=Necklace' },
      { name: 'Earrings', path: '/jewelry?category=Earrings' },
      { name: 'Bracelets', path: '/jewelry?category=Bracelet' },
      { name: 'Pendants', path: '/jewelry?category=Pendant' },
    ]},
    { title: 'Shop All', items: [
      { name: 'View All Jewelry', path: '/jewelry' },
      { name: 'Build Your Own Set', path: '/build-set' }
    ]}
  ],
  Gemstones: [
    { title: 'Precious Stones', items: [
      { name: 'Sapphire', path: '/gemstones/sapphire' },
      { name: 'Ruby', path: '/gemstones/ruby' },
      { name: 'Emerald', path: '/gemstones/emerald' }
    ]}
  ],
  Education: [
    { title: 'Guides', items: [
      { name: 'Diamond Guide', path: '/education/diamond-guide' },
      { name: 'Metal Education', path: '/education/metal-guide' },
      { name: 'Ring Size Guide', path: '/education/size-guide' }
    ]}
  ]
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key)
  }

  return (
    <nav className="w-full relative">
      {/* Top banner */}
      <div className="bg-navy-blue text-white text-center py-2 text-sm">
        <span className="hidden sm:inline">Find Your Forever Piece | </span>
        SHOP JEWELRY &gt;
      </div>
      
      {/* Contact and store info */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="hidden md:flex items-center gap-4">
          <a href="tel:91-9820025761" className="text-sm hover:text-gray-600">91-9820025761</a>
          {/* <Button variant="ghost" size="sm">Stores</Button>
          <Button variant="ghost" size="sm">Virtual Appointment</Button> */}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden sm:block">
            <input
              type="search"
              placeholder="Search"
              className="pl-3 pr-10 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate('/login')}>Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')}>Register</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Link to="/compare">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-medium uppercase tracking-wider">
              Compare
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-t border-b">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center">
            <Link to="/" className="mr-8">
              <span className="text-2xl font-serif font-bold text-navy-900 tracking-wide">TriMurti Gems</span>
            </Link>
            <div className="hidden md:flex gap-6">
              {Object.keys(navItems).map((key) => (
                <div key={key} className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1"
                    onClick={() => toggleDropdown(key)}
                  >
                    {key}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {activeDropdown === key && (
                    <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-lg p-6 z-50 w-[600px] grid grid-cols-3 gap-6">
                      {navItems[key].map((section, idx) => (
                        <div key={idx}>
                          <h3 className="font-semibold mb-2 text-navy-900">{section.title}</h3>
                          <ul className="space-y-2">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link 
                                  to={item.path} 
                                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors block py-1"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
            <div className="mt-12 space-y-6">
              {Object.entries(navItems).map(([key, sections]) => (
                <div key={key} className="border-b pb-4">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full"
                    onClick={() => toggleDropdown(key)}
                  >
                    {key}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {activeDropdown === key && (
                    <div className="mt-4 space-y-6">
                      {sections.map((section, idx) => (
                        <div key={idx}>
                          <h3 className="font-semibold mb-2">{section.title}</h3>
                          <ul className="space-y-2">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link to={item.path} className="text-sm text-gray-600 hover:text-blue-600 block py-2">
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar