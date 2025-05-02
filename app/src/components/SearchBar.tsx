'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type Filter = {
    query: string
    animal: 'all' | 'cat' | 'dog'
}

export function SearchBar({
                              filter,
                              setFilter,
                          }: {
    filter: Filter
    setFilter: (f: Filter) => void
}) {
    return (
        <div className="flex gap-2 items-end">
            <div>
                <Label htmlFor="search">Search</Label>
                <Input
                    id="search"
                    placeholder="username or caption..."
                    value={filter.query}
                    onChange={(e) => setFilter({ ...filter, query: e.target.value })}
                    className="w-48"
                />
            </div>

            <div>
                <Label htmlFor="animal">Animal</Label>
                <Select
                    value={filter.animal}
                    onValueChange={(value) => setFilter({ ...filter, animal: value as Filter['animal'] })}
                >
                    <SelectTrigger className="w-28">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="cat">Cats</SelectItem>
                        <SelectItem value="dog">Dogs</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
