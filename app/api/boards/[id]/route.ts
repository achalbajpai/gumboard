import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const boardId = (await params).id

    // Check if board exists and user has access
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: { organization: { include: { members: true } } }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 })
    }

    // Check if user is member of the organization
    const isMember = board.organization.members.some(member => member.id === session?.user?.id)
    
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Return board data without sensitive organization member details
    const { organization, ...boardData } = board
    
    return NextResponse.json({ 
      board: {
        ...boardData,
        organization: {
          id: organization.id,
          name: organization.name
        }
      }
    })
  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const boardId = (await params).id

    // Check if board exists and user has access
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: { 
        organization: { 
          include: { 
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true
              }
            }
          } 
        } 
      }
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 })
    }

    // Check if user is member of the organization
    const currentUser = board.organization.members.find(member => member.id === session?.user?.id)
    
    if (!currentUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if user can delete this board (board creator or admin)
    if (board.createdBy !== session.user.id && !currentUser.isAdmin) {
      return NextResponse.json({ error: "Only the board creator or admin can delete this board" }, { status: 403 })
    }

    // Delete the board
    await db.board.delete({
      where: { id: boardId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 