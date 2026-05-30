type LinkLike = {
  to?: string
  [key: string]: unknown
}

const isExternalOrHash = (to?: string) => {
  return !to || to.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(to)
}

export const useLocalizedPath = () => {
  const localePath = useLocalePath()

  return (to?: string) => {
    if (!to || isExternalOrHash(to)) {
      return to
    }

    return localePath(to)
  }
}

export const useLocalizedLinks = () => {
  const localizedPath = useLocalizedPath()

  return <T extends LinkLike>(links?: T[]) =>
    (links || []).map(link => ({
      ...link,
      to: localizedPath(link.to)
    }))
}
