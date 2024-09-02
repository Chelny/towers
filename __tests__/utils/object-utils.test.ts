import { removeNullUndefined } from "@/utils"

describe("removeNullUndefined Utility", () => {
  it("should remove null and undefined values from an object", () => {
    type ObjProps = {
      a: number
      b: number
      c: null
      d: undefined
      e: string
      f: string
    }
    const obj: ObjProps = { a: 0, b: 1, c: null, d: undefined, e: "", f: "test" }
    const result: NonNullableObject<ObjProps> = removeNullUndefined(obj)
    expect(result).toEqual({ a: 0, b: 1, e: "", f: "test" })
  })

  it("should handle an empty object", () => {
    type ObjProps = {}
    const obj: ObjProps = {}
    const result: NonNullableObject<ObjProps> = removeNullUndefined(obj)
    expect(result).toEqual(obj)
  })
})
