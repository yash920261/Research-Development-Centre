import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Faculty from "@/lib/models/Faculty"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const faculty = await Faculty.findById(params.id)

    if (!faculty) {
      return NextResponse.json({ success: false, error: "Faculty member not found" }, { status: 404 })
    }

    // Increment profile views
    await Faculty.findByIdAndUpdate(params.id, {
      $inc: { "analytics.profileViews": 1 },
      "analytics.lastUpdated": new Date(),
    })

    return NextResponse.json({
      success: true,
      faculty: faculty,
    })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch faculty member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      params.id,
      {
        ...body,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedFaculty) {
      return NextResponse.json({ success: false, error: "Faculty member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Faculty member updated successfully",
      faculty: updatedFaculty,
    })
  } catch (error) {
    console.error("Error updating faculty:", error)
    return NextResponse.json({ success: false, error: "Failed to update faculty member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const deletedFaculty = await Faculty.findByIdAndDelete(params.id)

    if (!deletedFaculty) {
      return NextResponse.json({ success: false, error: "Faculty member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Faculty member deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting faculty:", error)
    return NextResponse.json({ success: false, error: "Failed to delete faculty member" }, { status: 500 })
  }
}
