import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {}, // Skip update if exists (idempotent skip - FR-031)
    create: {
      email: "admin@test.com",
      name: "Test Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      isActive: true
    }
  })

  console.log("✅ Admin user created:", admin.email)

  // // Create teams for tournament
  // const teamsData = [
  //   {
  //     name: "ФК Старт",
  //     logo: null,
  //     coach: "Иванов Иван Иванович",
  //     city: "Москва",
  //     country: "Россия",
  //     isActive: true
  //   },
  //   {
  //     name: "ФК Динамо",
  //     logo: null,
  //     coach: "Петров Петр Петрович",
  //     city: "Москва",
  //     country: "Россия",
  //     isActive: true
  //   },
  //   {
  //     name: "ФК Спартак",
  //     logo: null,
  //     coach: "Сидоров Сидор Сидорович",
  //     city: "Москва",
  //     country: "Россия",
  //     isActive: true
  //   },
  //   {
  //     name: "ФК Зенит",
  //     logo: null,
  //     coach: "Козлов Козел Козлович",
  //     city: "Санкт-Петербург",
  //     country: "Россия",
  //     isActive: true
  //   },
  //   {
  //     name: "ФК Локомотив",
  //     logo: null,
  //     coach: "Морозов Мороз Морозович",
  //     city: "Москва",
  //     country: "Россия",
  //     isActive: true
  //   }
  // ]

  // // Create teams (idempotent)
  // const teams: { id: string; name: string }[] = []
  // for (const teamData of teamsData) {
  //     const existing = await prisma.team.findFirst({
  //     where: { name: teamData.name }
  //     })

  //   let team
  //     if (existing) {
  //     team = existing
  //   } else {
  //     team = await prisma.team.create({
  //       data: teamData
  //     })
  //   }

  //   teams.push({ id: team.id, name: team.name })
  // }

  // console.log(`✅ Teams: ${teams.length} teams ready`)

  // // Create tournament
  // const existingTournament = await prisma.tournament.findFirst({
  //   where: {
  //     name: "Start 25-26",
  //     season: "2024/2025"
  //   }
  // })

  // let tournament
  // if (existingTournament) {
  //   tournament = existingTournament
  //   console.log(`✅ Tournament already exists: ${tournament.name}`)
  // } else {
  //   tournament = await prisma.tournament.create({
  //     data: {
  //       name: "Start 25-26",
  //       description: "Главный турнир сезона 2024/2025",
  //       season: "2024/2025",
  //       location: "Санкт-Петербург",
  //       logo: null,
  //       startDate: new Date("2024-11-04"),
  //       endDate: new Date("2026-03-04"),
  //       isActive: true
  //     }
  //   })
  //   console.log(`✅ Tournament created: ${tournament.name}`)
  // }

  // // Add teams to tournament
  // for (const team of teams) {
  //   await prisma.tournamentTeam.upsert({
  //     where: {
  //       tournamentId_teamId: {
  //         tournamentId: tournament.id,
  //         teamId: team.id
  //       }
  //     },
  //     update: {},
  //     create: {
  //       tournamentId: tournament.id,
  //       teamId: team.id
  //     }
  //   })
  // }

  // console.log(`✅ Added ${teams.length} teams to tournament`)

  // // Create players for each team (2-3 players per team)
  // const playersData = [
  //   // ФК Старт
  //   {
  //     firstName: "Иван",
  //     lastName: "Петров",
  //     position: [Position.CF],
  //     dateOfBirth: new Date("2010-05-15"),
  //     teamId: teams[0].id,
  //     totalMatches: 25,
  //     totalGoals: 18,
  //     totalAssists: 7,
  //     totalMinutes: 1850,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Алексей",
  //     lastName: "Смирнов",
  //     position: [Position.CM],
  //     dateOfBirth: new Date("2009-08-22"),
  //     teamId: teams[0].id,
  //     totalMatches: 30,
  //     totalGoals: 5,
  //     totalAssists: 15,
  //     totalMinutes: 2100,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Сергей",
  //     lastName: "Козлов",
  //     position: [Position.GK],
  //     dateOfBirth: new Date("2010-11-28"),
  //     teamId: teams[0].id,
  //     totalMatches: 28,
  //     totalGoals: 0,
  //     totalAssists: 1,
  //     totalMinutes: 2520,
  //     videoLinks: []
  //   },
  //   // ФК Динамо
  //   {
  //     firstName: "Дмитрий",
  //     lastName: "Иванов",
  //     position: [Position.CB],
  //     dateOfBirth: new Date("2011-03-10"),
  //     teamId: teams[1].id,
  //     totalMatches: 20,
  //     totalGoals: 2,
  //     totalAssists: 4,
  //     totalMinutes: 1600,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Максим",
  //     lastName: "Волков",
  //     position: [Position.CM],
  //     dateOfBirth: new Date("2010-07-18"),
  //     teamId: teams[1].id,
  //     totalMatches: 22,
  //     totalGoals: 8,
  //     totalAssists: 10,
  //     totalMinutes: 1650,
  //     videoLinks: []
  //   },
  //   // ФК Спартак
  //   {
  //     firstName: "Роман",
  //     lastName: "Федоров",
  //     position: [Position.CF, Position.CAM],
  //     dateOfBirth: new Date("2010-09-30"),
  //     teamId: teams[2].id,
  //     totalMatches: 27,
  //     totalGoals: 20,
  //     totalAssists: 8,
  //     totalMinutes: 2025,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Артем",
  //     lastName: "Лебедев",
  //     position: [Position.CM],
  //     dateOfBirth: new Date("2009-06-25"),
  //     teamId: teams[2].id,
  //     totalMatches: 32,
  //     totalGoals: 7,
  //     totalAssists: 18,
  //     totalMinutes: 2400,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Владимир",
  //     lastName: "Соколов",
  //     position: [Position.CB, Position.CDM],
  //     dateOfBirth: new Date("2010-04-12"),
  //     teamId: teams[2].id,
  //     totalMatches: 24,
  //     totalGoals: 3,
  //     totalAssists: 6,
  //     totalMinutes: 1920,
  //     videoLinks: []
  //   },
  //   // ФК Зенит
  //   {
  //     firstName: "Никита",
  //     lastName: "Новиков",
  //     position: [Position.CB],
  //     dateOfBirth: new Date("2011-01-14"),
  //     teamId: teams[3].id,
  //     totalMatches: 18,
  //     totalGoals: 1,
  //     totalAssists: 3,
  //     totalMinutes: 1440,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Андрей",
  //     lastName: "Морозов",
  //     position: [Position.CF],
  //     dateOfBirth: new Date("2009-12-05"),
  //     teamId: teams[3].id,
  //     totalMatches: 15,
  //     totalGoals: 12,
  //     totalAssists: 3,
  //     totalMinutes: 1125,
  //     videoLinks: []
  //   },
  //   // ФК Локомотив
  //   {
  //     firstName: "Павел",
  //     lastName: "Кузнецов",
  //     position: [Position.GK],
  //     dateOfBirth: new Date("2010-02-20"),
  //     teamId: teams[4].id,
  //     totalMatches: 19,
  //     totalGoals: 0,
  //     totalAssists: 0,
  //     totalMinutes: 1710,
  //     videoLinks: []
  //   },
  //   {
  //     firstName: "Егор",
  //     lastName: "Попов",
  //     position: [Position.CF],
  //     dateOfBirth: new Date("2010-10-15"),
  //     teamId: teams[4].id,
  //     totalMatches: 21,
  //     totalGoals: 15,
  //     totalAssists: 5,
  //     totalMinutes: 1575,
  //     videoLinks: []
  //   }
  // ]

  // const createdPlayers: { id: string; teamId: string }[] = []
  // for (const playerData of playersData) {
  //   const existing = await prisma.player.findFirst({
  //     where: {
  //       firstName: playerData.firstName,
  //       lastName: playerData.lastName,
  //       dateOfBirth: playerData.dateOfBirth
  //     }
  //   })

  //   if (!existing) {
  //     const player = await prisma.player.create({
  //       data: playerData
  //     })
  //     createdPlayers.push({ id: player.id, teamId: player.teamId! })
  //   } else {
  //     createdPlayers.push({ id: existing.id, teamId: existing.teamId! })
  //   }
  // }

  // console.log(`✅ Players: ${createdPlayers.length} players ready`)

  // // Helper function to get players by team
  // const getPlayersByTeam = (teamId: string) => {
  //   return createdPlayers.filter(p => p.teamId === teamId)
  // }

  // // Create matches with different statuses
  // const now = new Date()
  // const matchesData = [
  //   // FINISHED match
  //   {
  //     date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  //     time: "15:00",
  //     stadium: "Стадион Старт",
  //     status: MatchStatus.FINISHED,
  //     homeTeamId: teams[0].id,
  //     awayTeamId: teams[1].id,
  //     homeScore: 2,
  //     awayScore: 1,
  //     tournamentId: tournament.id,
  //     homeScoreHT: 1,
  //     awayScoreHT: 0
  //   },
  //   // FINISHED match
  //   {
  //     date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  //     time: "18:00",
  //     stadium: "Стадион Динамо",
  //     status: MatchStatus.FINISHED,
  //     homeTeamId: teams[2].id,
  //     awayTeamId: teams[3].id,
  //     homeScore: 3,
  //     awayScore: 2,
  //     tournamentId: tournament.id,
  //     homeScoreHT: 2,
  //     awayScoreHT: 1
  //   },
  //   // FINISHED match
  //   {
  //     date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  //     time: "16:30",
  //     stadium: "Стадион Спартак",
  //     status: MatchStatus.FINISHED,
  //     homeTeamId: teams[4].id,
  //     awayTeamId: teams[0].id,
  //     homeScore: 1,
  //     awayScore: 4,
  //     tournamentId: tournament.id,
  //     homeScoreHT: 0,
  //     awayScoreHT: 2
  //   },
  //   // LIVE match
  //   {
  //     date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (but status LIVE)
  //     time: "19:00",
  //     stadium: "Стадион Зенит",
  //     status: MatchStatus.LIVE,
  //     homeTeamId: teams[1].id,
  //     awayTeamId: teams[2].id,
  //     homeScore: 1,
  //     awayScore: 1,
  //     tournamentId: tournament.id,
  //     homeScoreHT: 1,
  //     awayScoreHT: 0
  //   },
  //   // SCHEDULED match
  //   {
  //     date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  //     time: "17:00",
  //     stadium: "Стадион Локомотив",
  //     status: MatchStatus.SCHEDULED,
  //     homeTeamId: teams[3].id,
  //     awayTeamId: teams[4].id,
  //     homeScore: null,
  //     awayScore: null,
  //     tournamentId: tournament.id,
  //     homeScoreHT: null,
  //     awayScoreHT: null
  //   },
  //   // SCHEDULED match
  //   {
  //     date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  //     time: "15:30",
  //     stadium: "Стадион Старт",
  //     status: MatchStatus.SCHEDULED,
  //     homeTeamId: teams[0].id,
  //     awayTeamId: teams[3].id,
  //     homeScore: null,
  //     awayScore: null,
  //     tournamentId: tournament.id,
  //     homeScoreHT: null,
  //     awayScoreHT: null
  //   }
  // ]

  // // Check if matches already exist for this tournament
  // const existingMatches = await prisma.match.findMany({
  //   where: {
  //     tournamentId: tournament.id
  //   }
  // })

  // const createdMatches: { id: string; homeTeamId: string; awayTeamId: string; status: MatchStatus }[] = []

  // if (existingMatches.length > 0) {
  //   console.log(`✅ Matches already exist for tournament: ${existingMatches.length} matches`)
  //   // Use existing matches
  //   for (const match of existingMatches) {
  //     createdMatches.push({
  //       id: match.id,
  //       homeTeamId: match.homeTeamId,
  //       awayTeamId: match.awayTeamId,
  //       status: match.status
  //     })
  //   }
  // } else {
  //   // Create new matches
  //   for (const matchData of matchesData) {
  //     const match = await prisma.match.create({
  //       data: matchData
  //     })
  //     createdMatches.push({
  //       id: match.id,
  //       homeTeamId: match.homeTeamId,
  //       awayTeamId: match.awayTeamId,
  //       status: match.status
  //     })
  //   }
  //   console.log(`✅ Matches: ${createdMatches.length} matches created`)
  // }

  // // Add players to matches and create events
  // for (const match of createdMatches) {
  //   const homePlayers = getPlayersByTeam(match.homeTeamId)
  //   const awayPlayers = getPlayersByTeam(match.awayTeamId)

  //   // Check if players already added to match
  //   const existingMatchPlayers = await prisma.matchPlayer.findMany({
  //     where: { matchId: match.id }
  //   })

  //   if (existingMatchPlayers.length === 0) {
  //     // Add players to match
  //     for (let i = 0; i < Math.min(homePlayers.length, 11); i++) {
  //       const player = homePlayers[i]
  //       await prisma.matchPlayer.create({
  //         data: {
  //           matchId: match.id,
  //           playerId: player.id,
  //           teamId: match.homeTeamId,
  //           goals: match.status === MatchStatus.FINISHED ? (i === 0 ? 1 : 0) : 0,
  //           assists: match.status === MatchStatus.FINISHED ? (i === 1 ? 1 : 0) : 0,
  //           yellowCards: i === 2 ? 1 : 0,
  //           redCards: 0,
  //           minutesPlayed: match.status === MatchStatus.FINISHED ? 90 : 0,
  //           isStarter: i < 11,
  //           positionInFormation: i < 11 ? i + 1 : null
  //         }
  //       })
  //     }

  //     for (let i = 0; i < Math.min(awayPlayers.length, 11); i++) {
  //       const player = awayPlayers[i]
  //       await prisma.matchPlayer.create({
  //         data: {
  //           matchId: match.id,
  //           playerId: player.id,
  //           teamId: match.awayTeamId,
  //           goals: match.status === MatchStatus.FINISHED ? (i === 0 ? 1 : 0) : 0,
  //           assists: match.status === MatchStatus.FINISHED ? (i === 1 ? 1 : 0) : 0,
  //           yellowCards: i === 2 ? 1 : 0,
  //           redCards: 0,
  //           minutesPlayed: match.status === MatchStatus.FINISHED ? 90 : 0,
  //           isStarter: i < 11,
  //           positionInFormation: i < 11 ? i + 1 : null
  //         }
  //       })
  //     }
  //   }

  //   // Check if events already exist for match
  //   const existingEvents = await prisma.matchEvent.findMany({
  //     where: { matchId: match.id }
  //   })

  //   if (existingEvents.length === 0) {
  //     // Create events for match (5-10 events)
  //     const eventCount = Math.floor(Math.random() * 6) + 5 // 5-10 events
  //     const events = []

  //     // Event types mapping
  //     const eventTypes = [
  //       { eventId: 1, eventName: "Goal", subEventId: 10, subEventName: "Normal Goal" },
  //       { eventId: 2, eventName: "Shot", subEventId: 15, subEventName: "Shot on target" },
  //       { eventId: 3, eventName: "Free Kick", subEventId: 30, subEventName: "Direct free kick" },
  //       { eventId: 4, eventName: "Offside", subEventId: null, subEventName: null },
  //       { eventId: 5, eventName: "Corner Kick", subEventId: null, subEventName: null },
  //       { eventId: 6, eventName: "Throw In", subEventId: null, subEventName: null },
  //       { eventId: 7, eventName: "Foul", subEventId: 35, subEventName: "Foul" },
  //       { eventId: 8, eventName: "Pass", subEventId: 85, subEventName: "Simple pass" },
  //       { eventId: 9, eventName: "Dribble", subEventId: 70, subEventName: "Dribble" },
  //       { eventId: 10, eventName: "Tackle", subEventId: 40, subEventName: "Tackle" }
  //     ]

  //     for (let i = 0; i < eventCount; i++) {
  //       const isHomeTeam = Math.random() > 0.5
  //       const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId
  //       const teamPlayers = isHomeTeam ? homePlayers : awayPlayers
  //       const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  //       const matchPeriod = i < eventCount / 2 ? "1H" : "2H"
  //       const eventSec = new Prisma.Decimal((i * (90 / eventCount) * 60) + Math.random() * 60)
  //       const player = teamPlayers.length > 0 ? teamPlayers[Math.floor(Math.random() * teamPlayers.length)] : null

  //       const event = await prisma.matchEvent.create({
  //         data: {
  //           matchId: match.id,
  //           eventId: eventType.eventId,
  //           subEventId: eventType.subEventId,
  //           eventName: eventType.eventName,
  //           subEventName: eventType.subEventName,
  //           playerId: player?.id || null,
  //           teamId: teamId,
  //           matchPeriod: matchPeriod,
  //           eventSec: eventSec,
  //           startX: new Prisma.Decimal(Math.random() * 100),
  //           startY: new Prisma.Decimal(Math.random() * 100),
  //           endX: eventType.eventId === 8 ? new Prisma.Decimal(Math.random() * 100) : null, // Pass has end coordinates
  //           endY: eventType.eventId === 8 ? new Prisma.Decimal(Math.random() * 100) : null
  //         }
  //       })
  //       events.push(event)
  //     }

  //     console.log(`✅ Match ${match.id}: Added players and ${events.length} events`)
  //   } else {
  //     console.log(`✅ Match ${match.id}: Already has ${existingEvents.length} events`)
  //   }
  // }

  console.log(`✅ Seed completed successfully`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
