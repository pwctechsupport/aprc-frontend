import { useState } from "react";
import { debounce } from "lodash";
import { useDebounce } from "use-debounce";

// =============================================================================
// New hook
// =============================================================================

function useListState(initial: ListState) {
  const [state, setList] = useState<ListState>({
    filter: initial.filter || {},
    ...initial
  });
  const [delayedState] = useDebounce(state, 800);
  const setListDeb = debounce(setList, 800);

  function handlePageChange(page: number) {
    setList(prev => ({ ...prev, page }));
  }

  function handleChangeLimit(e: any) {
    const limit = e.value;
    setList(prev => ({ ...prev, limit: Number(limit), page: 1 }));
  }

  return {
    filter: state.filter,
    page: state.page,
    limit: state.limit,
    setList,
    setListDeb,
    delayedState,
    handlePageChange,
    handleChangeLimit
  };
}

interface ListState {
  filter?: Object | any;
  page?: number;
  limit?: number;
}

export default useListState;
