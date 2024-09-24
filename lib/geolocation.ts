import axios, { AxiosResponse } from "axios"

export async function getLocation(ipAddress: string | null): Promise<string | null> {
  if (!ipAddress) return null

  try {
    const response: AxiosResponse = await axios.get(
      `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
    )
    const data = response.data

    if (data.city && data.country) {
      return `${data.city || "[unknown city]"}, ${data.regionName || "[unknown region]"}, ${data.country || "[unknown country]"}`
    }
  } catch (error) {
    console.error("Error fetching location data:", error)
  }

  return null
}
