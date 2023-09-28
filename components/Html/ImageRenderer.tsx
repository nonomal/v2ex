import { load } from 'cheerio'
import { useContext, useMemo } from 'react'
import { Pressable } from 'react-native'
import { CustomBlockRenderer } from 'react-native-render-html'

import { isSvgURL } from '@/utils/url'
import { useScreenWidth } from '@/utils/useScreenWidth'

import StyledImage from '../StyledImage'
import { HtmlContext } from './HtmlContext'

const ImageRenderer: CustomBlockRenderer = ({ tnode, style }) => {
  const { onPreview, paddingX } = useContext(HtmlContext)

  const url = useMemo(() => {
    const $ = load(tnode.domNode as unknown as string)
    return $('img').attr('src')
  }, [tnode.domNode])

  const screenWidth = useScreenWidth()
  const containerWidth = !ancestorHasTdTag(tnode)
    ? screenWidth - paddingX
    : undefined

  if (url && isSvgURL(url))
    return <StyledImage style={style as any} source={{ uri: url }} />

  return (
    <Pressable
      onPress={ev => {
        ev.stopPropagation()
        if (url) onPreview(url)
      }}
    >
      <StyledImage
        style={style as any}
        source={{ uri: url }}
        containerWidth={containerWidth}
        priority="low"
      />
    </Pressable>
  )
}

function ancestorHasTdTag(parent: any): boolean {
  if (!parent) return false
  if (parent.tagName === 'td') return true
  return ancestorHasTdTag(parent.parent)
}

export default ImageRenderer
