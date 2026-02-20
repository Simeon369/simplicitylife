"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        className="relative px-3 py-2 text-gray-700 font-medium transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
        {isHovered && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
            layoutId="underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

const MobileNavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        className="block px-6 py-4 text-gray-700 font-medium text-lg hover:bg-gray-100 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </Link>
  );
};

const Nav = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const [isMenu, setIsMenu] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenu((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenu(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      y: "-100%",
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
      },
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <>
      <motion.nav
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm relative z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
          <Link href="/">
            <motion.div
              className="text-3xl font-bold text-black cursor-pointer"
              style={{ fontFamily: "var(--font-logo)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              SIMPLICITY
            </motion.div>
          </Link>

          <motion.div
            className="items-center hidden md:flex"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <NavLink href="/">Home</NavLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavLink href="/blog">Blog</NavLink>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavLink href="/about">About</NavLink>
            </motion.div>

            {isAuthenticated && isAdmin && (
              <motion.div variants={itemVariants}>
                <NavLink href="/admin">Admin Dashboard</NavLink>
              </motion.div>
            )}

            {isAuthenticated ? (
              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={logout}
                  className="px-5 py-2 bg-red-500 text-white ml-2 font-medium rounded-lg shadow-md"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "#dc2626",
                    boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Link href="/login">
                    <motion.div
                      className="px-4 py-2 text-gray-700 mr-2 font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link href="/register">
                    <motion.div
                      className="px-5 py-2 bg-black text-white mr-2 font-medium rounded-lg shadow-md cursor-pointer"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Register
                    </motion.div>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className="w-6 h-0.5 bg-gray-700 block"
              animate={isMenu ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-gray-700 block"
              animate={isMenu ? { opacity: 0 } : { opacity: 1 }}
            />
            <motion.span
              className="w-6 h-0.5 bg-gray-700 block"
              animate={isMenu ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            />
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenu && (
          <motion.div
            className="fixed inset-0 bg-white z-40 md:hidden overflow-y-auto"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="pt-24 pb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={mobileItemVariants}>
                <MobileNavLink href="/" onClick={closeMenu}>
                  Home
                </MobileNavLink>
              </motion.div>

              <motion.div variants={mobileItemVariants}>
                <MobileNavLink href="/blog" onClick={closeMenu}>
                  Blog
                </MobileNavLink>
              </motion.div>

              <motion.div variants={mobileItemVariants}>
                <MobileNavLink href="/about" onClick={closeMenu}>
                  About
                </MobileNavLink>
              </motion.div>

              <motion.div
                className="border-t border-gray-200 mt-4 pt-4"
                variants={mobileItemVariants}
              >
                {!isAuthenticated ? (
                  <div className="px-6 space-y-3">
                    <Link href="/login" onClick={closeMenu}>
                      <motion.div
                        className="block w-full px-4 py-3 text-center text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                        whileTap={{ scale: 0.98 }}
                      >
                        Login
                      </motion.div>
                    </Link>

                    <Link href="/register" onClick={closeMenu}>
                      <motion.div
                        className="block w-full px-4 py-3 text-center text-white font-medium rounded-lg shadow-md bg-black cursor-pointer"
                        whileTap={{ scale: 0.98 }}
                      >
                        Register
                      </motion.div>
                    </Link>
                  </div>
                ) : (
                  <div className="px-6 space-y-3">
                    {isAdmin && (
                      <MobileNavLink href="/admin" onClick={closeMenu}>
                        Admin Dashboard
                      </MobileNavLink>
                    )}

                    <motion.button
                      onClick={handleLogout}
                      className="block w-full px-4 py-3 text-center bg-red-500 text-white font-medium rounded-lg shadow-md"
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
