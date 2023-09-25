import { RouteProp, useRoute } from '@react-navigation/native'
import { useAtomValue } from 'jotai'
import { isString, upperCase } from 'lodash-es'
import { useQuery } from 'quaere'
import { useCallback, useState } from 'react'
import { FlatList, ListRenderItem } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Empty from '@/components/Empty'
import NavBar from '@/components/NavBar'
import NodeItem from '@/components/NodeItem'
import SearchBar from '@/components/SearchBar'
import { colorSchemeAtom } from '@/jotai/themeAtom'
import { navigation } from '@/navigation/navigationRef'
import { nodesQuery } from '@/servicies/node'
import { Node } from '@/servicies/types'
import { RootStackParamList } from '@/types'
import tw from '@/utils/tw'

export default function SearchNodeScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'SearchNode'>>()

  const [searchText, setSearchText] = useState('')

  const { data: matchNodes } = useQuery({
    query: nodesQuery,
    select: useCallback(
      (nodes: Node[]) => {
        return searchText
          ? nodes.filter(node =>
              [
                node.title,
                node.title_alternative,
                node.name,
                ...(node.aliases || []),
              ].some(
                text =>
                  isString(text) &&
                  upperCase(text).includes(upperCase(searchText))
              )
            )
          : nodes
      },
      [searchText]
    ),
  })

  const handlePressNodeItem = useCallback((node: Node) => {
    navigation.goBack()
    params.onPressNodeItem(node)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderNodeItem: ListRenderItem<Node> = useCallback(
    ({ item }) => (
      <NodeItem
        key={`${item.title}_${item.name}`}
        node={item}
        onPressNodeItem={handlePressNodeItem}
      />
    ),
    [handlePressNodeItem]
  )

  const colorScheme = useAtomValue(colorSchemeAtom)

  return (
    <SafeAreaView edges={['left', 'right']} style={tw`bg-body-1 flex-1`}>
      <NavBar hideSafeTop left={null}>
        <SearchBar
          style={tw`flex-1`}
          value={searchText}
          onChangeText={text => {
            setSearchText(text.trim())
          }}
          autoFocus
          placeholder="搜索节点"
        />
      </NavBar>

      <FlatList
        key={colorScheme}
        ListFooterComponent={<SafeAreaView edges={['bottom']} />}
        data={matchNodes}
        renderItem={renderNodeItem}
        ListEmptyComponent={<Empty description="暂无搜索结果" />}
      />
    </SafeAreaView>
  )
}
